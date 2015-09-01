from pymel.core import *

out = {
    "vertices": [],
    "normals" : [],
    "indices" : [],
    "uvs"     : []
}

mesh = ls('polySurface11Shape')[0]
#print ls('pasted__pasted__pPlane2Shape')[0]

#for mes in mesh:
print len(mesh.getPoints())

def exportMesh(out, mesh):
    out["indices"] = mesh.getTriangles()[1];

    transform = listRelatives(mesh, p=1)[0]
    scale = transform.getScale()
    customScale = 0.15;

    for vertex in mesh.getPoints():
        out["vertices"].append(vertex.x * scale[0] * customScale)
        out["vertices"].append(vertex.y * scale[1] * customScale)
        out["vertices"].append(vertex.z * scale[2] * customScale)

    for normal in mesh.getNormals():
        out["normals"].append(normal.x)
        out["normals"].append(normal.y)
        out["normals"].append(normal.z)

    us, vs = mesh.getUVs()
    print us
    print vs
    for i, u in enumerate(us):
        out["uvs"].append(u)
        out["uvs"].append(vs[i])

exportMesh(out, mesh)

print out