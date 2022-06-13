import _ from "lodash";

export const flattenObject = (obj: any): any => {
  function flattenPairs(obj_: any, prefix: string): [string, any][] {
    if (!_.isObject(obj_)) {
      return [prefix, obj_];
    }

    return _.toPairs(obj_).reduce((final: [string, any][], nPair: [string, any]) => {
      const flattened = flattenPairs(nPair[1], `${prefix}.${nPair[0]}`);
      if (flattened.length === 2 && !_.isObject(flattened[0]) && !_.isObject(flattened[1])) {
        return final.concat([flattened as [string, any]]);
      }

      return final.concat(flattened);
    }, []);
  }

  if (!_.isObject(obj)) {
    return JSON.stringify(obj);
  }

  const pairs: [string, any][] = _.toPairs(obj).reduce(
    (final: [string, any][], pair: [string, any]) => {
      const flattened = flattenPairs(pair[1], pair[0]);
      if (flattened.length === 2 && !_.isObject(flattened[0]) && !_.isObject(flattened[1])) {
        return final.concat([flattened as [string, any]]);
      }
      return final.concat(flattened);
    },
    []
  );

  return pairs.reduce((acc: any, pair: [string, any]) => {
    const [p0, p1] = pair;
    acc[p0] = p1;
    return acc;
  }, {});
};
