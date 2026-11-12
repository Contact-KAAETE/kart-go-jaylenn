"""Original neon fairground backdrop; Blender Cycles CPU, no external assets."""
import bpy,math,random,os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,col,metal=0,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.24
 if emission:p.inputs['Emission Color'].default_value=(*col,1);p.inputs['Emission Strength'].default_value=emission
 return m
blue=mat('midnight lacquer',(.012,.028,.10),.6);pink=mat('neon raspberry',(.9,.018,.35),.3,5);cyan=mat('neon cyan',(.01,.5,.95),.3,5);gold=mat('gold lights',(1,.48,.035),.6,3);purple=mat('purple roof',(.19,.025,.38),.5);white=mat('ivory',(.8,.84,.95),.2)
def cube(loc,scale,m,bevel=.1):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(m)
 if bevel:mod=o.modifiers.new('rounded edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('normals','WEIGHTED_NORMAL')
 return o
def rod(a,b,r,m):
 a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=r,depth=(b-a).length,location=(a+b)/2);o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
 return o
def sphere(loc,r,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=r,location=loc);o=bpy.context.object;o.data.materials.append(m)
 for p in o.data.polygons:p.use_smooth=True
# Sweeping glossy carnival floor, rows of lights and stage arch.
cube((0,3,-.25),(100,90,.5),blue)
for side in [-1,1]:
 for i in range(28):
  y=i*2-12;x=side*(6+y*.06);cube((x,y,.15),(.16,1.8,.15),cyan if side<0 else pink,.04)
 for i in range(8):
  x=side*(13+i*4.5);y=16+(i%3)*3;h=3+(i*7)%6;cube((x,y,h/2),(3.3,4,h),blue)
  for z in range(1,int(h)+1):cube((x,y-2.02,z),(2.9,.06,.045),cyan if i%2 else pink,.01)
  bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=2.7,radius2=0,depth=2.5,location=(x,y,h+1.25));bpy.context.object.data.materials.append(purple)
  sphere((x,y,h+2.6),.18,gold)
 for j in range(5):
  x=side*(9+j*5);y=6+j%2*4;cube((x,y,1.25),(3.4,3,2.5),purple);cube((x,y-1.55,2.35),(3.6,.13,.2),gold)
  for z in [-1,0,1]:cube((x+z,y-1.53,1.3),(.75,.08,1.3),cyan if j%2 else pink,.04)
# Grand arch high above the race horizon.
for i in range(40):
 a=i*math.pi/39;p=(-11*math.cos(a),13,2+11*math.sin(a));q=(-11*math.cos(a+math.pi/39),13,2+11*math.sin(a+math.pi/39));rod(p,q,.28,pink);sphere(p,.16,gold)
rod((-11,13,0),(-11,13,2),.4,cyan);rod((11,13,0),(11,13,2),.4,cyan)
# Ferris wheel: steel spokes, chrome double ring and glossy gondolas.
center=Vector((20,22,12));radius=10
for i in range(36):
 a=i*2*math.pi/36;b=(i+1)*2*math.pi/36;p=center+Vector((math.cos(a)*radius,0,math.sin(a)*radius));q=center+Vector((math.cos(b)*radius,0,math.sin(b)*radius));rod(p,q,.13,pink)
 if i%3==0:
  rod(center,p,.055,cyan);cube(p+Vector((0,0,-.4)),(1.4,1.6,.9),purple);cube(p+Vector((0,-.8,-.25)),(1.1,.06,.4),gold);sphere(p,.19,cyan)
rod((16,22,0),center,.19,white);rod((24,22,0),center,.19,white);sphere(center,.65,gold)
# Coaster swoop on the left, hand-built continuous rails.
for n in range(65):
 t=n/64;x=-32+t*24;y=16+t*7;z=2+8*math.sin(t*math.pi)**2;p=(x,y,z);u=(x+.375,y+.11,2+8*math.sin((t+1/64)*math.pi)**2)
 for off in [-.45,.45]:rod((p[0],p[1]+off,p[2]),(u[0],u[1]+off,u[2]),.09,cyan if off<0 else pink)
 if n%5==0:rod((x,y,0),p,.08,gold)
# Original starburst fireworks rendered as luminous filaments.
rng=random.Random(230)
for x,y,z in [(-23,29,18),(-8,33,23),(6,32,21),(29,35,23)]:
 m=[pink,cyan,gold][rng.randrange(3)]
 for n in range(22):
  a=n*2*math.pi/22;size=2+rng.random()*2;rod((x+math.cos(a)*size*.35,y,z+math.sin(a)*size*.35),(x+math.cos(a)*size,y,z+math.sin(a)*size),.035,m)
# Camera and lighting.
bpy.ops.object.camera_add(location=(0,-19,6));cam=bpy.context.object;cam.rotation_euler=(Vector((0,17,9))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=22;bpy.context.scene.camera=cam
for loc,power,col,size in [((0,-6,15),3600,(.35,.6,1),18),((-13,6,7),1600,(1,.05,.25),10),((16,7,10),2400,(.02,.55,1),12)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.color=col;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,12,0))-o.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=False;s.render.resolution_x=1280;s.render.resolution_y=720;s.render.resolution_percentage=100;s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.004,.007,.04,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.18;s.use_nodes=True;nodes=s.node_tree.nodes;nodes.clear();layer=nodes.new('CompositorNodeRLayers');glow=nodes.new('CompositorNodeGlare');glow.glare_type='FOG_GLOW';glow.quality='HIGH';glow.threshold=1.2;glow.size=8;output=nodes.new('CompositorNodeComposite');s.node_tree.links.new(layer.outputs['Image'],glow.inputs['Image']);s.node_tree.links.new(glow.outputs['Image'],output.inputs['Image']);s.view_settings.view_transform='AgX';s.render.image_settings.file_format='PNG';s.render.filepath=os.path.abspath('.qa/party-fairground.png');bpy.ops.render.render(write_still=True)
