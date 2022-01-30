import { Alert } from "../../components/alert/alert.component";
import { environment } from "../../environment";

const MyOrders = ({ orders, errors }) => {
  if (errors) {
    return (
      <div className="container">
        <Alert classBinding="alert-danger">{errors}</Alert>
      </div>
    );
  }
  return (
    <div className="container">
      <table style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Ticket Title</th>
            <th>Purchase Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.ticket.title}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

MyOrders.getInitialProps = async (context, client, currentUser) => {
  try {
    const { data } = await client.get(environment.NEXT_PUBLIC_ORDER);
    return { orders: data.reverse(), errors: null };
  } catch (err) {
    return { orders: null, errors: err.response.data.message };
  }
};

export default MyOrders;
