(()=>{
'use strict';
const T=window.TM;
T.jingleAfter=i=>[3,7,10].includes(((i%T.TRACKS.length)+T.TRACKS.length)%T.TRACKS.length);
})();