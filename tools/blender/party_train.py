"""Original Lucky Block supply train for Jaylenn's Party World."""
exec(open('tools/blender/party_fairground.py').read().split('# Sweeping glossy carnival')[0])
yellow=mat('Lucky gold',(1,.62,.025),.5);red=mat('gloss cherry',(.65,.018,.12),.6);black=mat('rubber',(.012,.018,.03),.25)
for wagon in range(4):
 x=wagon*3.2;cube((x,0,.95),(2.7,1.8,.35),red);cube((x,0,1.4),(2.7,1.8,.45),blue)
 for wx in [-.85,.85]:
  for wy in [-1,1]:
   o=rod((x+wx,wy*.95,.6),(x+wx,wy*1.12,.6),.52,black);rod((x+wx,wy*1.13,.6),(x+wx,wy*1.18,.6),.26,gold)
 if wagon:
  for b in [-.65,.65]:
   cube((x+b,0,2.28),(1.12,1.12,1.12),yellow,.14)
   bpy.ops.object.text_add(location=(x+b-.26,-.58,1.94),rotation=(math.pi/2,0,0));t=bpy.context.object;t.data.body='?';t.data.size=.85;t.data.extrude=.025;t.data.materials.append(white)
 else:
  cube((x-.4,0,2.0),(1.6,1.5,1.0),red,.3);cube((x+.8,0,2.2),(.9,1.5,1.6),blue);cube((x+.8,-.77,2.4),(.65,.07,.6),cyan);cube((x+.8,0,3.12),(1.3,2,.18),gold)
  rod((x-.8,0,2.1),(x-.8,0,3.15),.28,blue);sphere((x-1.27,-.42,2.0),.23,gold);sphere((x-1.27,.42,2.0),.23,gold)
  for i in range(4):sphere((x-.8+i*.12,.02,3.45+i*.44),.28+i*.07,white)
 if wagon<3:rod((x+1.3,0,.9),(x+1.9,0,.9),.09,gold)
bpy.ops.object.camera_add(location=(-4,-16,10));cam=bpy.context.object;cam.rotation_euler=(Vector((4,0,1.8))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=16;bpy.context.scene.camera=cam
for loc,power,col in [((0,-6,10),1600,(.75,.9,1)),((8,3,8),1900,(1,.4,.18))]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.size=8;o.data.color=col;o.rotation_euler=(Vector((3,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=40;s.cycles.use_denoising=False;s.render.resolution_x=960;s.render.resolution_y=480;s.render.resolution_percentage=100;s.render.film_transparent=True;s.world.color=(.2,.2,.2);s.view_settings.view_transform='AgX';s.render.filepath=os.path.abspath('.qa/party-train.png');s.render.image_settings.file_format='PNG';bpy.ops.render.render(write_still=True)
