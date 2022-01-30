import "bootstrap/dist/css/bootstrap.min.css";
import { buildClient } from "../api/build-client";
import { Header } from "../components/header/header.component";
import { environment } from "../environment";
import "../styles/globals.css";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div className="container-fluid">
      <Header currentUser={currentUser} />
      <Component currentUser={currentUser} {...pageProps} />
      <div id="modal-root"></div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get(
    `${environment.NEXT_PUBLIC_AUTH}/currentUser`
  );
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return { pageProps, ...data };
  //return {};
};

export default AppComponent;
