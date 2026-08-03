const deepEqual = (a, b) => {
    if (a === b) return true;
  
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;
  
    if (Array.isArray(a)) {
      if (!Array.isArray(b) || a.length !== b.length) return false;
      return a.every((val, idx) => deepEqual(val, b[idx]));
    }
  
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
  
    return aKeys.every(key => deepEqual(a[key], b[key]));
  };

  export default deepEqual;