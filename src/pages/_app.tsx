import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import AppWrapper from "@/components/AppWrapper";
import { Authenticator } from "@aws-amplify/ui-react";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_EGsJfm0Hr",
      userPoolClientId: "57g4qrjj2t64kvqvauppgfidj",
      identityPoolId: "us-east-1:acdeec6f-f297-4cca-b9a1-794647e5790e",
      loginWith: {
        email: true,
      },
      userAttributes: {
        email: {
          required: true,
        },
      },
    },
  },
  API: {
    Events: {
      endpoint:
        "https://pkqs5d2chzaujores5h5vx3vxy.appsync-api.us-east-1.amazonaws.com/event",
      defaultAuthMode: "apiKey",
      apiKey: "da2-htqruw42l5c5tnaiihitmgjq54",
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator>
      {() => (
        <AppWrapper>
          <Component {...pageProps} />
        </AppWrapper>
      )}
    </Authenticator>
  );
}
