import { useState } from "react";
import { environment } from "../../environment";
import { useRequest } from "../../hooks/use-request";
import { Alert } from "../alert/alert.component";
import { FloatingInput } from "../floating-input/floating-input.component";

export const CreateNewTicket = ({ closeModal }) => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const { performRequest, errors } = useRequest(environment.NEXT_PUBLIC_TICKET);

  const roundOffPrice = (e) => {
    if (!price) {
      return;
    }
    const value = parseFloat(price).toFixed(2);
    setPrice(value);
    e.target.value = value;
  };

  const createTicket = (e) => {
    e.preventDefault();
    performRequest("post", { title, price })
      .then((res) => {
        closeModal();
      })
      .catch((err) => {});
  };

  return (
    <form onSubmit={createTicket}>
      <FloatingInput
        type="text"
        id="floatingTitle"
        label="Ticket Title"
        placeholder="Enter Ticket Title"
        autoComplete="off"
        onChange={(e) => setTitle(e.target.value)}
      />
      <FloatingInput
        type="number"
        id="floatingPrice"
        label="Price"
        placeholder="Enter Ticket Price"
        onChange={(e) => setPrice(e.target.value)}
        onBlur={(e) => roundOffPrice(e)}
        min="0"
      />
      <button
        type="submit"
        className="btn btn-outline-primary btn-form-submit"
        disabled={title.trim() === "" || price <= 0}
      >
        Create
      </button>
      {errors && <Alert classBinding="alert-danger">{errors}</Alert>}
    </form>
  );
};
