export const generateRandomString = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};


export const reqLimitAndOffsetObj = (req): { limit: number; offset: number } => {

  const rawLimit = typeof req.query.limit === 'string' ? req.query.limit : undefined;
  const rawOffset = typeof req.query.offset === 'string' ? req.query.offset : undefined;  
  const limit = rawLimit ? Math.max(1, Math.min(50, parseInt(rawLimit, 10) || 20)) : 20;
  const offset = rawOffset ? Math.max(0, parseInt(rawOffset, 10) || 0) : 0; 

  return { limit: limit, offset: offset };
}