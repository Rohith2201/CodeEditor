import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '../contexts/AppContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AppProvider>
        <Component {...pageProps} />
      </AppProvider>
    </SessionProvider>
  );
}

export default MyApp;

