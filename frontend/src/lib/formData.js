export function toFormData(payload) {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => formData.append(`${key}[]`, entry))
      return
    }

    formData.append(key, value)
  })

  return formData
}
