import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map, shareReplay } from 'rxjs';
import { AuthService } from '../../../helpers/services/auth.service';
import { ProductService } from '../../../helpers/services/product.service';
import { OrderService } from '../../../helpers/services/order.service';
import { Product } from '../../../helpers/models/product.model';
import { Order } from '../../../helpers/models/order.model';
import { LoadingCardComponent } from '../../../components/loading-card/loading-card.component';

interface DashboardSummaryCard {
  label: string;
  value: number;
  caption: string;
  icon: string;
  variant: 'primary' | 'success' | 'warning' | 'info';
  format?: 'number' | 'currency';
}

interface LowStockRow {
  id: number;
  name: string;
  unitsInStock: number;
  reorderLevel: number;
  status: 'critical' | 'warning';
}

interface RecentOrderRow {
  id: number;
  customer: string;
  date: string;
  status: 'Gönderildi' | 'Hazırlanıyor';
  total: number;
}

interface DashboardViewModel {
  summary: DashboardSummaryCard[];
  lowStock: LowStockRow[];
  recentOrders: RecentOrderRow[];
  totals: {
    revenue: number;
    averageOrderValue: number;
    pendingCount: number;
  };
}

@Component({
  selector: 'app-admin-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    NgClass,
    RouterLink,
    LoadingCardComponent,
  ],
})
export class HomeComponent {
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;

  private readonly products$ = this.productService
    .getProducts()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  private readonly orders$ = this.orderService
    .getOrders()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly dashboard$ = combineLatest([this.products$, this.orders$]).pipe(
    map(([products, orders]) => this.buildDashboard(products, orders)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private buildDashboard(products: Product[], orders: Order[]): DashboardViewModel {
    const lowStockThreshold = 20;

    const totalProducts = products.length;
    const activeProducts = products.filter((product) => !product.discontinued).length;

    const revenue = orders.reduce(
      (total, order) => total + this.computeOrderValue(order, products),
      0
    );
    const averageOrderValue = orders.length ? revenue / orders.length : 0;

    const deliveredOrders = orders.filter((order) => this.isOrderDelivered(order));
    const pendingOrders = orders.length - deliveredOrders.length;

    const lowStockItems = products
      .filter((product) => (product.unitsInStock ?? 0) <= lowStockThreshold)
      .sort((a, b) => (a.unitsInStock ?? 0) - (b.unitsInStock ?? 0))
      .slice(0, 5)
      .map<LowStockRow>((product) => ({
        id: product.id,
        name: product.name,
        unitsInStock: product.unitsInStock ?? 0,
        reorderLevel: lowStockThreshold,
        status: (product.unitsInStock ?? 0) === 0 ? 'critical' : 'warning',
      }));

    const summary: DashboardSummaryCard[] = [
      {
        label: 'Toplam Ürün',
        value: totalProducts,
        caption: `${activeProducts} aktif`,
        icon: 'fas fa-boxes',
        variant: 'primary',
        format: 'number',
      },
      {
        label: 'Toplam Sipariş',
        value: orders.length,
        caption: `${deliveredOrders.length} teslim edildi`,
        icon: 'fas fa-clipboard-check',
        variant: 'warning',
        format: 'number',
      },
      {
        label: 'Tahmini Ciro',
        value: revenue,
        caption: 'Siparişlerden hesaplandı',
        icon: 'fas fa-dollar-sign',
        variant: 'success',
        format: 'currency',
      },
      {
        label: 'Düşük Stoklu Ürün',
        value: lowStockItems.length,
        caption: 'Eşik altındaki ürünler',
        icon: 'fas fa-exclamation-triangle',
        variant: 'info',
        format: 'number',
      },
    ];

    const recentOrders: RecentOrderRow[] = [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: order.customerName,
        date: order.orderDate,
        status: this.isOrderDelivered(order) ? 'Gönderildi' : 'Hazırlanıyor',
        total: this.computeOrderValue(order, products),
      }));

    return {
      summary,
      lowStock: lowStockItems,
      recentOrders,
      totals: {
        revenue,
        averageOrderValue,
        pendingCount: pendingOrders,
      },
    };
  }

  private computeOrderValue(order: Order, products: Product[]): number {
    const product = products.find((item) => item.id === order.productId);
    return (product?.unitPrice ?? 0) * (order.amount ?? 0);
  }

  private isOrderDelivered(order: Order): boolean {
    const expected = new Date(order.expectedDeliveryDate ?? '');
    if (Number.isNaN(expected.getTime())) {
      return false;
    }

    const now = new Date();
    return expected.getTime() <= now.getTime();
  }
}
