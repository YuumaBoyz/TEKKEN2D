export const VFX_ATLASES={
 contact:{file:'assets/vfx/contact-v2.png',columns:4,rows:4,bands:[[0,315],[315,635],[635,945],[945,1254]]},
 energy:{file:'assets/vfx/energy-v2.png',columns:4,rows:4,bands:[[0,320],[320,620],[620,915],[915,1254]]},
 motion:{file:'assets/vfx/motion-v2.png',columns:4,rows:4,bands:[[0,345],[345,710],[710,945],[945,1254]]}
};
// Draw sizes use the game's 960×540 coordinate space, with integer pixels.
export const VFX_TYPES={
 hit:{atlas:'contact',row:0,size:112,frameTime:.045},
 heavy:{atlas:'contact',row:1,size:170,frameTime:.055},
 guard:{atlas:'contact',row:2,size:110,frameTime:.050},
 dust:{atlas:'contact',row:3,size:145,frameTime:.065,ground:true},
 redElectric:{atlas:'energy',row:0,size:170,frameTime:.060},
 purpleElectric:{atlas:'energy',row:1,size:170,frameTime:.060},
 purification:{atlas:'energy',row:2,size:165,frameTime:.065},
 rage:{atlas:'energy',row:3,size:290,frameTime:.075},
 kick:{atlas:'motion',row:0,size:150,frameTime:.045},
 upper:{atlas:'motion',row:1,size:155,frameTime:.050},
 dash:{atlas:'motion',row:2,size:170,frameTime:.050,ground:true},
 armor:{atlas:'motion',row:3,size:135,frameTime:.050}
};
export function fighterEnergy(id){return id===2?'purification':id===0?'redElectric':'purpleElectric';}
