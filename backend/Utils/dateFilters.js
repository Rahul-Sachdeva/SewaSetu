export const buildDateRange = ({ fromMonth, toMonth }) => {
  if (!fromMonth && !toMonth) return null;

  const range = {};

  if (fromMonth) {
    range.$gte = new Date(`${fromMonth}-01`);
  }

  if (toMonth) {
    const end = new Date(`${toMonth}-01`);
    end.setMonth(end.getMonth() + 1);
    range.$lt = end;
  }

  return range;
};
