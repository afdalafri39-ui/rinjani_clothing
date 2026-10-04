import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Rinjani Clothing — Made for the Journey',
  description: 'Rinjani Clothing creates everyday apparel inspired by movement, nature, and urban culture. Minimalist clothing catalog & custom printing service.',
  keywords: ['Rinjani Clothing', 'Kaos Rinjani', 'Oversize Tee', 'Hoodie', 'Custom Printing', 'Streetwear Indonesia'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
