"""Original Kart Go chicken mounts. Blender 4.x, Cycles CPU; no paid assets.
Run: blender -b -t 4 --python tools/blender/chicken_riders.py
"""
import bpy, math, os, random
from mathutils import Vector
OUT=os.path.abspath('assets/graphics/chickens');os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color,metal=0,rough=.35):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
white=material('warm porcelain feathers',(.94,.87,.65));red=material('raspberry comb',(.68,.018,.055));orange=material('golden beak',(.98,.39,.025));black=material('pupil',(.007,.012,.02));eye=material('eye whites',(1,.99,.91));aqua=material('electric cyan saddle',(.02,.63,.9),.5);seat=material('saddle leather',(.022,.034,.06));gold=material('golden buckle',(1,.65,.06),.7);pink=material('pink tongue',(.95,.17,.27))
def orb(name,loc,scale,mat,rot=(0,0,0)):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;o.rotation_euler=rot;o.data.materials.append(mat)
 for p in o.data.polygons:p.use_smooth=True
 return o
objects=[]
def chicken(i):
 global objects
 before=set(bpy.data.objects);rng=random.Random(i+120)
 coat=[white,material('copper feathers',(.52,.14,.025)),material('violet disco feathers',(.25,.07,.52),.15)][i];tip=[material('pearl edges',(1,.97,.85)),material('gold edges',(.95,.53,.1)),material('cyan feathers',(.055,.7,.65),.1)][i]
 orb('plump teardrop body',(0,0,1.3),(.77,1.03,.8),coat)
 # Layered feather wings, separate polished plumes, no block mesh.
 for side in [-1,1]:
  orb('wing',(side*.65,-.05,1.35),(.27,.68,.44),coat,(0,side*.15,side*.2))
  for f in range(7):orb('overlapping wing feather',(side*(.72+f*.016),-.48+f*.13,1.23-f*.018),(.13,.34,.13),tip,(0,side*.25,side*.14))
  orb('rubber band leg',(side*.34,.04,.45),(.075,.08,.43),orange)
  for toe in range(3):orb('goofy splayed toe',(side*.34+(toe-1)*.13,-.2,.12),(.075,.35,.07),orange,(0,0,(toe-1)*.35))
 for f in range(8):orb('glossy tail plume',((f-3.5)*.095,-.86,1.83+(f%3)*.11),(.12,.5,.26),tip,(.7,0,(f-3.5)*.12))
 # A long neck and backwards-looking head keep the silly face visible from behind.
 orb('crooked neck',(.14,.52,2.02),(.32,.33,.7),coat,(.12,.17,-.1))
 orb('wobbly head',(.14,.42,2.69),(.49,.42,.5),coat,(.08,0,[-.15,.16,-.2][i]))
 for side in [-1,1]:
  x=.14+side*.27;z=2.78+(side*.06 if i!=1 else -side*.09)
  orb('ridiculous bulging eyeball',(x,.075,z),(.24,.18,.265),eye)
  # Deliberately opposing gaze, an original comic chicken design.
  orb('eye iris',(x+side*.045,-.085,z+side*.105),(.095,.045,.11),material('iris'+str(side)+str(i),[(.03,.38,.22),(.5,.21,.035),(.04,.35,.55)][i]))
  orb('tiny pupil',(x+side*.045,-.119,z+side*.105),(.045,.02,.065),black)
  orb('catchlight',(x+side*.045-.024,-.138,z+side*.105+.035),(.022,.012,.026),eye)
 orb('upper wonky beak',(.14,-.13,2.51),(.33,.31,.13),orange,(0,.12,-.08))
 orb('open beak gap',(.14,-.15,2.39),(.22,.22,.095),black)
 orb('lower beak',(.15,-.13,2.29),(.26,.25,.075),orange)
 orb('tongue',(.19,-.33,2.35),(.11,.12,.04),pink)
 for k in range(4):orb('floppy comb',(.09+(k-1)*.15,.42,3.08+math.sin(k*.8)*.17),(.13,.13,.26),red,(0,(k-1)*.25,0))
 for side in [-1,1]:orb('pendulous wattle',(.14+side*.15,.09,2.17),(.12,.11,.26),red,(0,side*.25,0))
 # Actual saddle on the chicken, leaving room for the player's raster driver.
 orb('racing saddle',(0,-.13,2.0),(.48,.5,.13),seat);orb('cyan saddle trim',(0,-.18,1.99),(.51,.52,.075),aqua)
 for side in [-1,1]:orb('saddle strap',(side*.62,-.2,1.6),(.055,.13,.44),seat,(0,side*.3,0));orb('saddle buckle',(side*.68,-.26,1.5),(.06,.15,.1),gold)
 if i==1:
  for side in [-1,1]:orb('aviator goggle rim',(.14+side*.28,-.035,2.8-side*.09),(.27,.055,.29),gold)
 if i==2:
  for k in range(4):orb('disco crest',(.14,.39+k*.12,3.15-k*.02),(.075,.14,.29),tip,(.4,0,0))
 objects=list(set(bpy.data.objects)-before)
def lighting():
 for name,loc,power,size,col in [('key',(-4,-5,7),850,5,(1,.84,.64)),('fill',(4,-2,4),650,4,(.48,.79,1)),('rim',(1,4,6),1100,3,(.55,.9,1))]:
  bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.name=name;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.data.color=col;l.rotation_euler=(Vector((0,0,1.5))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=False;scene.render.resolution_x=512;scene.render.resolution_y=640;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.world.color=(.14,.16,.2);scene.view_settings.view_transform='AgX';lighting()
for i in range(3):
 chicken(i)
 for view,loc in [('rear',(0,-8.5,4.9)),('card',(4,-7.7,4.3))]:
  cam.location=loc;cam.rotation_euler=(Vector((0,0,1.65))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.4;scene.render.filepath=f'{OUT}/chicken-{i}-{view}.png';bpy.ops.render.render(write_still=True)
 for o in objects:bpy.data.objects.remove(o,do_unlink=True)
