import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";
import { Alert } from "../../components/alert/alert.component";
import { environment } from "../../environment";
import { useRequest } from "../../hooks/use-request";

const OrderShow = ({ order, error, currentUser }) => {
  if (error) {
    return (
      <div className="container">
        <Alert classBinding="alert-danger">{error}</Alert>
      </div>
    );
  }

  const [timeLeft, setTimeLeft] = useState(0);
  const { performRequest, errors } = useRequest(
    environment.NEXT_PUBLIC_PAYMENT
  );
  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeLeft = (new Date(order.expiresAt) - new Date()) / 1000;
      setTimeLeft(Math.round(timeLeft));
    };
    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const chargePayment = async (id) => {
    try {
      await performRequest("post", { orderId: order.id, token: id });
      Router.push("/orders");
    } catch (err) {}
  };

  if (timeLeft <= 0) {
    return (
      <div className="container">
        <p>Order Expired!!</p>
      </div>
    );
  }

  return (
    <div className="container">
      <p>Remaining time to purchase: {timeLeft}s.</p>
      {errors && <Alert classBinding="alert-danger">{errors}</Alert>}
      <StripeCheckout
        token={({ id }) => chargePayment(id)}
        stripeKey={environment.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  try {
    const { orderId } = context.query;
    const { data } = await client.get(
      `${environment.NEXT_PUBLIC_ORDER}/${orderId}`
    );
    return { order: data, error: null };
  } catch (err) {
    return { order: null, error: err.response.data.message };
  }
};

export default OrderShow;
