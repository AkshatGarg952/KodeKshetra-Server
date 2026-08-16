export const toDateKey = (input = new Date()) => {
  const date = input instanceof Date ? input : new Date(input);
  return date.toISOString().slice(0, 10);
};

export const dateFromKey = (dateKey) => new Date(`${dateKey}T00:00:00.000Z`);

export const getCurrentDateBucket = (input = new Date()) => {
  const dateKey = toDateKey(input);
  return {
    dateKey,
    date: dateFromKey(dateKey)
  };
};

export const shiftDateKey = (dateKey, daysDelta) => {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + daysDelta);
  return toDateKey(date);
};
