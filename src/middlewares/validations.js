
export const validEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const passwordStrength = (password) => {
  let strongPassword = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})')
  let mediumPassword = new RegExp('^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))')

  if (strongPassword.test(password)) {
    return { value: 3, message: 'Strong password', color: 'green' }
  } else if (mediumPassword.test(password)) {
    return { value: 2, message: 'Medium password', color: 'yellow' }
  } else {
    return { value: 1, message: 'Too weak password', color: 'red' }
  }
}

export const validString = (str) => {
  let cleanString = new RegExp(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/)
  if (cleanString.test(str)) return true
  return false
}

export const onlyLetters = (str) => {
  let cleanText = new RegExp('[A-Za-z ]+$')
  if (cleanText.test(str)) return true
  return false
}

export const isDate = (date) => {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}