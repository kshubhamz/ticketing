import { useState } from "react";
import Router from "next/router";
import { FloatingInput } from "../floating-input/floating-input.component";
import { Alert } from "../alert/alert.component";
import { useRequest } from "../../hooks/use-request";
import { environment } from "../../environment";

export function SignIn({ closeModal }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { performRequest, errors } = useRequest(
    `${environment.NEXT_PUBLIC_AUTH}/signin`
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    performRequest("post", { email, password })
      .then((res) => {
        closeModal();
        Router.push("/");
      })
      .catch((err) => {});
  };

  return (
    <form onSubmit={handleSubmit}>
      <FloatingInput
        type="email"
        id="floatingEmail"
        label="Email Address"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <FloatingInput
        type="password"
        id="floatingPassword"
        label="Password"
        placeholder="Enter Your password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-outline-primary btn-form-submit"
        disabled={!email.trim() || !password.trim()}
      >
        Sign In
      </button>
      {errors && <Alert classBinding="alert-danger">{errors}</Alert>}
    </form>
  );
}
