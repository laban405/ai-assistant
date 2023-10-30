import { Html, Head, Main, NextScript } from 'next/document'
import { useContext } from 'react';
import { Context } from './_app';


export default function Document() {
      const value = useContext(Context);

      return (<Html data-layout-style="default" data-sidebar-size="lg" data-sidebar="dark" data-layout-mode="light"
            data-layout-width="fluid" data-layout-position="fixed" data-topbar="light" data-layout="vertical">
            <Head>
                  <meta charSet="utf-8" />

                  <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                  <meta name="author" content="NextAi" />
                  <meta name="description"
                        content={value?.config.NEXT_PUBLIC_COMPANY_META_DESCRIPTION ? value?.config.NEXT_PUBLIC_COMPANY_META_DESCRIPTION : 'NextAi - NextJs is powerful AI Content Management System which is cover Writing blog, Ecommerce, Portfolio, Company Profile, and many more.'}
                  />
                  <meta name="keywords"
                        content={value?.config.NEXT_PUBLIC_COMPANY_KEYWORDS ? JSON.parse(value?.config.NEXT_PUBLIC_COMPANY_KEYWORDS).join(',') : 'NextAi'}
                  />
                  <link rel="shortcut icon"
                        href={value?.config.NEXT_PUBLIC_COMPANY_FAVICON ? JSON.parse(value?.config.NEXT_PUBLIC_COMPANY_FAVICON)[0].fileUrl : '../public/uploads/defaultImage.png'} />
            </Head>
            <body data-aos-easing="ease-out-back" data-aos-duration="3000" data-aos-delay="0" data-layout-mode="light">
                  <Main />
                  <NextScript />
            </body>
      </Html>)
}
