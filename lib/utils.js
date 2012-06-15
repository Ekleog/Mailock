exports.unique = function(arr) {
   // cf. http://stackoverflow.com/a/1890233
   var hash = {};
   var ret = [];
   for (var i = 0, l = arr.length ; i < l ; ++i) {
      if (!hash.hasOwnProperty(arr[i])) {
         hash[arr[i]] = true;
         ret.push(arr[i]);
      }
   }
   return ret;
}
