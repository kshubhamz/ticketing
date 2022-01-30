import { Alert } from "../alert/alert.component";

export const TicketDetails = ({
  ticket,
  currentUser,
  onPurchase,
  purchaseError,
}) => {
  return (
    <div>
      <div>Title: {ticket.title}</div>
      <div>Price: {ticket.price}</div>
      {currentUser && (
        <button
          className="btn btn-sm btn-outline-primary btn-form-submit"
          onClick={onPurchase}
        >
          Purchase
        </button>
      )}
      {purchaseError && (
        <Alert classBinding="alert-danger">{purchaseError}</Alert>
      )}
    </div>
  );
};
