import { useRouter } from "next/router";
import Head from "next/head";

/** Needs translation keys: 'NAME' */
export default function Metadata({children, LANGUAGE_NAMES, TEXT, title, description, keywords, longTitle=null, 
                                    thumbnailURL=null, ogType="website", allowIndex=true}){
    const {locale, basePath, asPath} = useRouter();
    
    const canonicalURL = "https://"+process.env.DOMAIN+basePath+"/"+locale+asPath;
    

    let pageTitle = ((title && title.length > 0) ? title+" - " : "") + TEXT['NAME'] + 
             ((locale && locale.length > 0) ? " ("+locale.substring(0,2).toUpperCase()+")" : "");

    longTitle = longTitle || title || TEXT['NAME'];

    let components = [];
    
    // Default meta tags
    for(let locale in LANGUAGE_NAMES){
        const key = "meta-alternate-link-"+locale;
        const href = "https://"+process.env.DOMAIN+basePath+"/"+locale+asPath;
        components.push(<link key={key} rel="alternate" hrefLang={locale} href={href} />);
    }

    if(description && description.length > 0)
        components.push(<meta key="meta-description" name="description" content={description} />);

    if(keywords && keywords.length > 0)
        components.push(<meta key="meta-keywords" name="keywords" content={keywords} />);
    
    components.push(<link key="meta-canonical" rel="canonical" href={canonicalURL} />);

    if(!allowIndex) components.push(<meta key="meta-robots" name="robots" content="noindex" />);

    
    // Facebook OG Tags
    components.push(<meta key="meta-og-title" property="og:title" content={longTitle} />);

    if(description && description.length > 0)
        components.push(<meta key="meta-og-description" property="og:description" content={description} />);

    if(thumbnailURL && thumbnailURL.length > 0)
        components.push(<meta key="meta-og-image" property="og:image" content={thumbnailURL} />);
    
    if(ogType && ogType.length > 0)
        components.push(<meta key="meta-og-type" property="og:type" content={ogType} />);
    
    components.push(<meta key="meta-og-site-name" property="og:site_name" content={TEXT['NAME']} />);
    components.push(<meta key="meta-og-url" property="og:url" content={canonicalURL} />);


    // Twitter Tags
    components.push(<meta key="meta-twitter-card" name="twitter:card" content="summary_large_image" />);
    components.push(<meta key="meta-twitter-title" name="twitter:title" content={longTitle} />);

    if(description && description.length > 0)
        components.push(<meta key="meta-twitter-description" name="twitter:description" content={description} />);

    if(thumbnailURL && thumbnailURL.length > 0)
        components.push(<meta key="meta-twitter-image" name="twitter:image" content={thumbnailURL} />);

        
    
    return (
        <Head>
            <title>{pageTitle}</title>
            <link rel="apple-touch-icon" sizes="57x57" href="/images/favicons/apple-icon-57x57.png" />
            <link rel="apple-touch-icon" sizes="60x60" href="/images/favicons/apple-icon-60x60.png" />
            <link rel="apple-touch-icon" sizes="72x72" href="/images/favicons/apple-icon-72x72.png" />
            <link rel="apple-touch-icon" sizes="76x76" href="/images/favicons/apple-icon-76x76.png" />
            <link rel="apple-touch-icon" sizes="114x114" href="/images/favicons/apple-icon-114x114.png" />
            <link rel="apple-touch-icon" sizes="120x120" href="/images/favicons/apple-icon-120x120.png" />
            <link rel="apple-touch-icon" sizes="144x144" href="/images/favicons/apple-icon-144x144.png" />
            <link rel="apple-touch-icon" sizes="152x152" href="/images/favicons/apple-icon-152x152.png" />
            <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-icon-180x180.png" />
            <link rel="icon" type="image/png" sizes="192x192" href="/images/favicons/android-icon-192x192.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/images/favicons/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="96x96" href="/images/favicons/favicon-96x96.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/images/favicons/favicon-16x16.png" />
            <link rel="manifest" href="/manifest.json" />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="msapplication-TileImage" content="/images/favicons/ms-icon-144x144.png" />
            <meta name="theme-color" content="#ffffff" />
            {components}
            {children}
        </Head>
    )
}


Metadata.addTranslationKeys = function(set){
    [ // used translation keys
        'NAME'
    ].forEach((value) => set.add(value));
}