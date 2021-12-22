

const logger = (req,res,next) => {
    console.log(`${req.method} 'method' ${req.protocol} : //${req.get('Host')} ${req.originalUrl}`)
    next()
}

module.exports = logger