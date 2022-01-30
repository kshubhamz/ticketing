export const environment = {
  NEXT_PUBLIC_AUTH: "/api/users",
  NEXT_PUBLIC_TICKET: "/api/tickets",
  NEXT_PUBLIC_ORDER: "/api/orders",
  NEXT_PUBLIC_PAYMENT: "/api/payments",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.replace("-m ", "").replace(
      /^\s+|\s+$/g,
      ""
    ),
};
/*export const environment = {
  NEXT_PUBLIC_AUTH: process.env.NEXT_PUBLIC_AUTH,
  NEXT_PUBLIC_TICKET: process.env.NEXT_PUBLIC_TICKET,
  NEXT_PUBLIC_ORDER: process.env.NEXT_PUBLIC_ORDER,
  NEXT_PUBLIC_PAYMENT: process.env.NEXT_PUBLIC_PAYMENT,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
}; */
