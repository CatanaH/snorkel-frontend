import Page from 'pages/index';
import { rootDomain } from "src/lib/constants";

export async function getServerSideProps(context) {
  const area_two = context.query.area_two;
  const area_one = context.query.area_one;
  const country = context.query.country;
  const sorts = ['top', 'latest', 'default']
  const props = {};
  await Promise.all(sorts.map(async sort => {
    let res;
    res = await fetch(
      `${rootDomain}/spots/get?sort=${sort}&area_one=${area_one}&country=${country}&area_two=${area_two}`
    )
    const data = await res.json()
    props[sort] = data.data || null;
    if (data.area) {
      props['area'] = data.area;
    }
    return data;
  }))

  if (!props.default) {
    return {
      notFound: true,
    }
  }

  return {
    props, // will be passed to the page component as props
  }
}

export default Page