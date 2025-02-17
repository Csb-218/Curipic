const isValidEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
}

const isValidName = (name) => {
    return name.length > 1 && name.length < 100
}

module.exports = {isValidEmail,isValidName}