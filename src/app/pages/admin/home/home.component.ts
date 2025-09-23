import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map, shareReplay } from 'rxjs';
import { AuthService } from '../../../helpers/services/auth.service';
import { ProductService } from '../../../helpers/services/product.service';
import { OrderService } from '../../../helpers/services/order.service';
import { Product } from '../../../helpers/models/product.model';
import { Order } from '../../../helpers/models/order.model';

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
  status: 'Shipped' | 'Pending';
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
  imports: [AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgClass, RouterLink],
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
    const totalProducts = products.length;
    const activeProducts = products.filter((product) => !product.discontinued).length;
    const lowStockItems = products
      .filter((product) => product.unitsInStock <= Math.max(product.reorderLevel, 10))
      .sort((a, b) => a.unitsInStock - b.unitsInStock)
      .slice(0, 5);

    const shippedOrders = orders.filter((order) => this.isOrderShipped(order));
    const pendingOrders = orders.length - shippedOrders.length;

    const revenue = orders.reduce((total, order) => total + this.computeOrderTotal(order), 0);
    const averageOrderValue = orders.length ? revenue / orders.length : 0;

    const summary: DashboardSummaryCard[] = [
      {
        label: 'Total Products',
        value: totalProducts,
        caption: `${activeProducts} active`,
        icon: 'fas fa-boxes',
        variant: 'primary',
        format: 'number',
      },
      {
        label: 'Pending Orders',
        value: pendingOrders,
        caption: `${shippedOrders.length} shipped`,
        icon: 'fas fa-clipboard-check',
        variant: 'warning',
        format: 'number',
      },
      {
        label: 'Avg. Order Value',
        value: averageOrderValue,
        caption: 'Across all orders',
        icon: 'fas fa-dollar-sign',
        variant: 'success',
        format: 'currency',
      },
      {
        label: 'Low Stock Items',
        value: lowStockItems.length,
        caption: 'Below reorder threshold',
        icon: 'fas fa-exclamation-triangle',
        variant: 'info',
        format: 'number',
      },
    ];

    const lowStock: LowStockRow[] = lowStockItems.map((product) => ({
      id: product.id,
      name: product.name,
      unitsInStock: product.unitsInStock,
      reorderLevel: product.reorderLevel,
      status: product.unitsInStock === 0 ? 'critical' : 'warning',
    }));

    const recentOrders: RecentOrderRow[] = [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: order.customerId,
        date: order.orderDate,
        status: this.isOrderShipped(order) ? 'Shipped' : 'Pending',
        total: this.computeOrderTotal(order),
      }));

    return {
      summary,
      lowStock,
      recentOrders,
      totals: {
        revenue,
        averageOrderValue,
        pendingCount: pendingOrders,
      },
    };
  }

  private computeOrderTotal(order: Order): number {
    return order.details.reduce((total, detail) => {
      const discountMultiplier = 1 - (detail.discount ?? 0);
      return total + detail.unitPrice * detail.quantity * discountMultiplier;
    }, 0);
  }

  private isOrderShipped(order: Order): boolean {
    return Boolean(order.shippedDate && order.shippedDate.trim().length > 0);
  }
}
