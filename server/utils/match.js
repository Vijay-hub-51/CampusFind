export function matchScore(lost, found){
  let score=0;
  if(lost.category?.toLowerCase()===found.category?.toLowerCase()) score+=30;
  if(lost.color && found.color && lost.color.toLowerCase()===found.color.toLowerCase()) score+=20;
  if(lost.brand && found.brand && lost.brand.toLowerCase()===found.brand.toLowerCase()) score+=20;
  if(lost.location?.toLowerCase()===found.location?.toLowerCase()) score+=20;
  const days=Math.abs(new Date(lost.date)-new Date(found.date))/(1000*60*60*24);
  if(days<=1) score+=10; else if(days<=3) score+=5;
  return Math.min(score,100);
}
