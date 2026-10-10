export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const getApiErrorMessage = (error, defaultMsg = 'An unexpected error occurred') => {
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((e) => e.message).join(', ');
  }
  return error.response?.data?.message || error.message || defaultMsg;
};
