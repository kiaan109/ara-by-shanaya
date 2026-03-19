import { CartItem } from "@/store/cartStore";
import { formatINR } from "@/utils/format";

interface Customer {
  name: string;
  phone: string;
}

export function createOrderMailto(items: CartItem[], customer: Customer) {
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const body = [
    "Hello ARA by Shanaya team,",
    "",
    "Please confirm my order details below:",
    "",
    ...items.flatMap((item, idx) => [
      `${idx + 1}. Outfit: ${item.product.name}`,
      `   Price: ${formatINR(item.product.price)}`,
      `   Size: ${item.size}`,
      `   Quantity: ${item.quantity}`,
      "",
    ]),
    `Customer Name: ${customer.name}`,
    `Customer Phone: ${customer.phone}`,
    `Order Total: ${formatINR(total)}`,
  ].join("\n");

  const subject = `New Order - ${items.map((i) => i.product.name).join(", ")}`;
  return `mailto:arabyshanya@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
