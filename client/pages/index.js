import Router from "next/router";
import { useState } from "react";
import { TicketDetails } from "../components/ticket-details/ticket-details.component";
import { Ticket } from "../components/ticket/ticket.component";
import { environment } from "../environment";
import { useRequest } from "../hooks/use-request";
import { Modal } from "../modules/modal/modal.component";

const Home = ({ currentUser, tickets }) => {
  const [showTicket, setShowTicket] = useState(null);
  const [allTicket, setAllTicket] = useState(tickets);
  const [purchaseError, setPurchaseError] = useState(null);
  const { performRequest, errors } = useRequest(environment.NEXT_PUBLIC_ORDER);

  const filterTicket = (e) => {
    allTicket = tickets.filter((ticket) =>
      ticket.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setAllTicket(allTicket);
  };

  const purchaseTicket = async () => {
    try {
      const data = await performRequest("post", { ticketId: showTicket.id });
      setPurchaseError(null);
      setShowTicket(null);
      Router.push("/orders/[orderId]", `/orders/${data.id}`);
    } catch (err) {
      setPurchaseError(err);
    }
  };

  return (
    <div className="container">
      <div className="search-box">
        <input
          className="search-inp-box"
          type="text"
          placeholder="Search Ticket"
          onChange={(e) => filterTicket(e)}
        />
      </div>
      {!allTicket.length && <h3 style={{ marginLeft: "50%" }}>No Results!!</h3>}
      <div className="row g-2">
        {allTicket.map((ticket) => (
          <Ticket
            key={ticket.id}
            ticket={ticket}
            viewTicket={() => setShowTicket(ticket)}
          />
        ))}
      </div>
      <Modal
        show={showTicket}
        title="View Ticket"
        onClose={() => {
          setShowTicket(null);
          setPurchaseError(null);
        }}
        body={
          <TicketDetails
            ticket={showTicket}
            currentUser={currentUser}
            onPurchase={purchaseTicket}
            purchaseError={purchaseError}
          />
        }
      />
    </div>
  );
};

Home.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get(environment.NEXT_PUBLIC_TICKET);
  return { tickets: data };
};

export default Home;
