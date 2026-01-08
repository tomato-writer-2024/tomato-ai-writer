// 类型统一从schema和types导出
export * from "./shared/schema";

// 从types导出枚举
export { MembershipLevel, UserRole } from "@/lib/types/user";

// 订单状态枚举
export { OrderStatus } from "./orderManager";

// 直接导入Manager类并创建实例
import { UserManager } from "./userManager";
import { WorkManager } from "./workManager";
import { AuthManager } from "./authManager";
import { OrderManager } from "./orderManager";

// Manager实例导出
export const userManager = new UserManager();
export const workManager = new WorkManager();
export const authManager = new AuthManager();
export const orderManager = new OrderManager();
