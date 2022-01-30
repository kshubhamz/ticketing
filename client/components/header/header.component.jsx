import Router from "next/router";
import Link from "next/link";
import { useState } from "react";
import { environment } from "../../environment";
import { useRequest } from "../../hooks/use-request";
import { Modal } from "../../modules/modal/modal.component";
import { CreateNewTicket } from "../create-new-ticket/create-new-ticket.component";
import { SignIn } from "../sign-in/signin";
import { SignUp } from "../sign-up/signup";

export const Header = ({ currentUser }) => {
  const [showCreateTicketModel, setShowCreateTicketModel] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const { performRequest } = useRequest(
    `${environment.NEXT_PUBLIC_AUTH}/signout`
  );

  const signOut = () => {
    performRequest("post", {})
      .then((res) => {
        Router.push("/");
      })
      .catch((err) => {});
  };

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {currentUser && (
            <li
              className="hoverable nav-link"
              onClick={() => setShowCreateTicketModel(true)}
            >
              Create New Ticket
            </li>
          )}
          {!currentUser && (
            <li
              className="hoverable nav-link"
              onClick={() => setShowSignUpModal(true)}
            >
              Sign Up
            </li>
          )}
          {!currentUser && (
            <li
              className="hoverable nav-link"
              onClick={() => setShowSignInModal(true)}
            >
              Sign In
            </li>
          )}
          {currentUser && (
            <li className="nav-link">
              <Link href="/orders">
                <a>My Orders</a>
              </Link>
            </li>
          )}
          {currentUser && (
            <li className="hoverable nav-link" onClick={signOut}>
              Sign Out
            </li>
          )}
        </ul>
      </div>
      <Modal
        show={showCreateTicketModel}
        onClose={() => setShowCreateTicketModel(false)}
        title="Create Ticket"
        body={
          <CreateNewTicket closeModal={() => setShowCreateTicketModel(false)} />
        }
      />
      <Modal
        show={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        title="Sign In"
        body={<SignIn closeModal={() => setShowSignInModal(false)} />}
      />
      <Modal
        show={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        title="Sign Up"
        body={<SignUp closeModal={() => setShowSignUpModal(false)} />}
      />
    </nav>
  );
};
