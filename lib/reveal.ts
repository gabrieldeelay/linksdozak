// Keep one timeline across observer callbacks, so two separate viewport batches
// cannot restart their first card at the same time.
export function createDominoTimeline(gap=260){
 let nextStart=0;
 return {reserve(now:number){const start=Math.max(now,nextStart);nextStart=start+gap;return start-now;}};
}
