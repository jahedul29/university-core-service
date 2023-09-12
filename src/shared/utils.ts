export const asyncForEach = async (array: any, callback: any) => {
  if (!Array.isArray(array)) {
    throw new Error('Expected to be an array');
  }
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
};
