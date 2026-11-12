"""Original playful giant cat for Jaylenn's Party World; no purchased assets."""
import bpy,os,math
from mathutils import Vector
base=open('tools/blender/chicken_riders.py').read();exec(base[:base.index('objects=[]')])
fur=material('blue violet velvet fur',(.16,.12,.24),0,.6);lightfur=material('silvery cheeks',(.5,.47,.62),0,.5);green=material('luminous green iris',(.24,.95,.045),.1);nose=material('pink nose',(.8,.09,.2));mouth=material('warm mouth',(.12,.012,.045));tooth=material('ivory tooth',(.98,.94,.78));
orb('huge fluffy head',(0,.1,1.7),(1.45,.83,1.3),fur)
for side in [-1,1]:
 orb('cheek',(side*.81,-.54,1.13),(.68,.4,.46),lightfur)
 bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=.56,radius2=.04,depth=1.3,location=(side*1.07,.11,2.85));e=bpy.context.object;e.data.materials.append(fur);e.rotation_euler[1]=side*.2;be=e.modifiers.new('rounded ears','BEVEL');be.width=.13;be.segments=4
 orb('inner ear',(side*1.08,-.13,2.98),(.28,.09,.4),nose,(0,side*.2,0))
 orb('eye socket',(side*.62,-.61,2.05),(.55,.19,.39),black,(0,0,side*.15))
 orb('big green eye',(side*.62,-.77,2.06),(.43,.11,.32),green)
 orb('vertical pupil',(side*.62,-.86,2.06),(.07,.025,.25),black)
 orb('eye shine',(side*.62-.12,-.889,2.16),(.07,.02,.08),eye)
 orb('eyebrow',(side*.67,-.63,2.46),(.56,.13,.13),fur,(0,0,side*.15))
 orb('raised paw',(side*1.7,-.25,.81),(.52,.45,.56),fur,(0,side*.2,side*.2))
 for finger in range(3):
  orb('paw toe',(side*1.7+(finger-1)*.2,-.65,.88),(.13,.15,.24),lightfur)
  bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.075,radius2=.006,depth=.3,location=(side*1.7+(finger-1)*.2,-.77,1.03));bpy.context.object.data.materials.append(tooth)
 # Long whiskers use thin smooth curves.
 for k in range(3):
  curve=bpy.data.curves.new('whisker','CURVE');curve.dimensions='3D';curve.bevel_depth=.014;curve.bevel_resolution=2;s=curve.splines.new('BEZIER');s.bezier_points.add(2)
  for p,co in zip(s.bezier_points,[(side*.6,-.92,1.22),(side*1.2,-.89,1.2+(k-1)*.18),(side*1.9,-.5,1.3+(k-1)*.26)]):p.co=co;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
  o=bpy.data.objects.new('silly long whisker',curve);bpy.context.collection.objects.link(o);o.data.materials.append(eye)
orb('open smiling mouth',(0,-.74,.99),(.68,.21,.56),mouth);orb('tongue',(0,-.95,.65),(.33,.06,.14),pink);orb('little pink nose',(0,-.98,1.48),(.25,.13,.15),nose)
for x in [-.42,-.18,.18,.42]:orb('comic tooth',(x,-.95,1.3),(.09,.06,.15),tooth)
for loc,power,col in [((-4,-5,7),1000,(.55,.75,1)),((4,-3,5),800,(1,.5,.7)),((0,4,7),1400,(.4,.7,1))]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.size=5;l.data.color=col;l.rotation_euler=(Vector((0,0,1.5))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-9,3.4));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,1.7))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=4.9
scene=bpy.context.scene;scene.camera=cam;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=False;scene.render.resolution_x=640;scene.render.resolution_y=640;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.world.color=(.15,.17,.2);scene.view_settings.view_transform='AgX';scene.render.filepath=os.path.abspath('assets/graphics/chickens/party-cat.png');bpy.ops.render.render(write_still=True)
