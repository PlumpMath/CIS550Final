(function(){
    
    // temp
    function getNodeArrayByKeyword(word, onLoaded) {
        // TODO: look up in NoSQL DB and get a json array of node_id
        var array;
        
        // TODO
        
        onLoaded(array);
    }
    
    function searchQuery(wordsArray) {
        
        // TODO: get a list of node for each of the key word
        
        for(word in wordsArray) {
            // get the node json array 
            getNodeArrayByKeyword(word, function(nodeIDs) {
                // Send it to Route finder
            });
        }
        
        
    }
    
})();
