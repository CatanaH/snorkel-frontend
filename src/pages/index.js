import React, { useEffect, useState } from "react";
import Head from 'next/head';
import Link from 'next/link';

import styles from "components/Home/Home.module.css"
import SearchBar from "components/SearchBar"
import Layout from 'components/Layout/Layout';
import Carousel from "components/Carousel/Carousel"
import { rootDomain } from "src/lib/constants";
import Banner from "components/EmailBanner";
import Cookies from "js-cookie";
import { useCurrentUser } from 'context/usercontext';
import useGoogleOneTap from "hooks/useGoogleOneTap";
import { useRouter } from "next/router";

export async function getStaticProps(context) {
  const sorts = ['top', 'latest', 'default']
  const props = {};
  await Promise.all(sorts.map(async sort => {
    let res;
    res = await fetch(`${rootDomain}/spots/get?sort=${sort}`)

    const data = await res.json()
    props[sort] = data.data || null;
    return data;
  }))

  if (!props.default) {
    return {
      notFound: true,
    }
  }

  props['area'] = {
    'name': 'us',
  }

  props['loc'] = 'country';

  return {
    props, // will be passed to the page component as props
    revalidate: 3600,
  }
}

// '/' route
const Home = (props) => {
  const [shouldShowBanner, setShouldShowBanner] = React.useState(false);
  const [recs, setRecs] = React.useState(null);
  const [areas, setAreas] = React.useState([]);
  const { state } = useCurrentUser();

  React.useEffect(() => {
    setShouldShowBanner(!(Cookies.get('has_seen_banner') || Cookies.get('csrf_access_token')));

    if (document.referrer.match(/^https?:\/\/([^\/]+\.)?google\.com(\/|$)/i)) {
      setShouldShowBanner(false);
    }
  }, [])

  React.useEffect(() => {
    if (!state.user) { return }
    fetch(`${rootDomain}/spots/recs`).then(res =>
      res.json()
    ).then(data => {
      setRecs(data.data)
    })
  }, [state.user])

  React.useEffect(() => {
    fetch(`${rootDomain}/locality/${props.loc}`).then(res =>
      res.json()
    ).then(data => {
      setAreas(data.data)
    })
  }, [areas])

  React.useEffect(useGoogleOneTap('/', state.user), [state])

  let title = "Zentacle - Snorkel and Scuba Diving Reviews, Maps, and Photos"
  let description = "Search dive and snorkel spots around the world with maps, detailed reviews, and photos curated by oceans lovers like you."
  if (props.area && props.area.name && props.area.name !== 'Maui') {
    title = `Zentacle - ${props.area.name} - Snorkel and Scuba Diving Reviews, Maps, and Photos`;
    description = `Search dive and snorkel spots in ${props.area.name} with maps, detailed reviews, and photos curated by oceans lovers like you.`
  }

  return (
    <Layout>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} key="og:title" />
        <meta property="og:description" content={description} key="og:description" />
        <meta property="og:image" content="https://www.zentacle.com/social_background_v2.jpg" key="og:image" />
        <meta name="description" content={description} key="description" />
      </Head>
      <div className={styles.container}>
        <div className={styles.image}>
          <div className={styles.imageinner} style={{ 'backgroundImage': `url(\'/hero.jpg\')` }}>
            <h2 className={styles.pagetitle}>Find your next underwater adventure</h2>
          </div>
          <div className={styles.menu}>
            <SearchBar></SearchBar>
          </div>
        </div>
        <Banner isShown={shouldShowBanner}></Banner>
        <div className={styles.contentContainer}>
          <div className={styles.locationContainer}>
            {areas.map(area => (
              <Link key={area.short_name} href={area.url}>
                <a className={`${styles.location} ${props.area.short_name === area.short_name && styles.active}`}>
                  {area.name}
                </a>
              </Link>)
            )}
          </div>
          <h1 className={styles.areaTitle}>Best Snorkeling and Scuba Diving in {props.area.name}</h1>
          {recs && Object.keys(recs).length > 0 && <div>
            <div className={styles.carouseltitle}>Recommended Locations (Rate spots to personalize!)</div>
            <Carousel data={recs}></Carousel>
          </div>}
          <div>
            <h2 className={styles.carouseltitle}>{`Most Popular Snorkel and Scuba Diving Locations in ${props.area.name}`}</h2>
            <Carousel data={props.default}></Carousel>
          </div>
          <div>
            <h2 className={styles.carouseltitle}>{`Top Rated Snorkel and Scuba Diving Locations in ${props.area.name}`}</h2>
            <Carousel data={props.top}></Carousel>
          </div>
          <div>
            <div className={styles.carouseltitle}>Conditions Reported Recently</div>
            <Carousel data={props.latest}></Carousel>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Home;
