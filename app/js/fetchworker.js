self.addEventListener('message',  e => {
    let url = e.data;
    
    fetch(url).then(res => {
        if (res.ok) {
            self.postMessage(res);
        } else {
            throw new Error("Can't load data from external URL");
        }
    }).catch(err => {
        self.postMessage(err.message);
    });
})