exports.unique = function(arr) {
   // cf. http://stackoverflow.com/a/1890233
   let hash = {};
   let ret = [];
   for (let i = 0, l = arr.length ; i < l ; ++i) {
      if (!hash.hasOwnProperty(arr[i])) {
         hash[arr[i]] = true;
         ret.push(arr[i]);
      }
   }
   return ret;
}

exports.randstr = function() {
   // cf. http://stackoverflow.com/a/1349426
   let ret = "";
   let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
      "abcdefghijklmnopqrstuvwxyz" +
      "0123456789";
   for (let i = 0 ; i < 5 ; i++)
      ret += alphabet[Math.floor(Math.random() * alphabet.length)];
   return ret;
}

exports.format = function(str) {
   // cf. http://stackoverflow.com/a/4673436 (slightly modified)
   let args = arguments;
   return str.replace(/{([^}]+)}/g, function(match, number) { 
      number = parseInt(number) + 1;
      return typeof args[number] != 'undefined' ? args[number] : match;
   });
}

exports.rowcols = function(str) {
   let rows = 1, cols = 0, curcol = 0;
   for each (c in str) {
      if (c == '\n') {
         rows += 1;
         if (curcol > cols)
            cols = curcol;
         curcol = 0;
      } else {
         curcol += 1;
      }
   }
   return { rows: rows, cols: cols };
}
