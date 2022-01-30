import styles from "./ticket.styles.module.css";

export const Ticket = ({ ticket, viewTicket }) => {
  return (
    <div
      className={`card ${styles.ticket_card} col col-lg-4 col-sm-12`}
      onClick={viewTicket}
    >
      <h3>{ticket.title}</h3>
      <p>Price: {ticket.price}INR</p>
    </div>
  );
};
