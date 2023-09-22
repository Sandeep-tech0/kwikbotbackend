const corsOpts={
    origin:'*',
    methods:[
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH'
    ],
    
    allowedHeaders: [
        'Content-Type',
        'Access-Control-Allow-Origin', 
        'Origin', 
        'Accept',
        'authorization'
    ],
};

module.exports = corsOpts;