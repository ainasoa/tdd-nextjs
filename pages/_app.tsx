import server from "mocks/server";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";
import { SessionProvider } from "next-auth/react";
import AppBar from "@/pages/lib/AppBar";

if (process.env.NODE_ENV === "development") {
  server.listen();
}
export default function App({ Component, pageProps }: any) {
  const { session, ...restProps } = pageProps;
  return (
    <SessionProvider session={session}>
      <AppBar />
      <Component {...restProps} />
    </SessionProvider>
  );
}
