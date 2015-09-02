from pymel.core import *
FLOAT_PRECISION = 8

out = {
    "vertices": [],
    "indices": [],
    "uvs": [],
    "normals": [],
    "skinWeights": [],
    "skinIndices": [],
    "animations": []
}

jointNames = {}

mesh = ls(type="mesh")[0]

def exportMesh(out):
    out["indices"] = mesh.getTriangles()[1];

    for vertex in mesh.getPoints():
        out["vertices"].append(vertex.x)
        out["vertices"].append(vertex.y)
        out["vertices"].append(vertex.z)

    for normal in mesh.getNormals():
        out["normals"].append(normal.x)
        out["normals"].append(normal.y)
        out["normals"].append(normal.z)

    for uv in mesh.getUVs():
        out["uvs"].append(uv)

def exportBones(out, jointNames):
    bones = []

    for joint in ls(type='joint'):
        if joint.getParent():
            parentIndex = _indexOfJoint(joint.getParent().name(), jointNames)
        else:
            parentIndex = -1
            
        rotq = joint.getRotation(quaternion=True) * joint.getOrientation()
        pos = joint.getTranslation()

        bones.append({
            "parent": parentIndex,
            "name": joint.name(),
            "pos": _roundPos(pos),
            "rotq": _roundQuat(rotq)
        })

    out["bones"] = bones

def _indexOfJoint(name, jointNames):
    if len(jointNames) == 0:
        jointNames = dict([(joint.name(), i) for i, joint in enumerate(ls(type='joint'))])

    if name in jointNames:
        return jointNames[name]
    else:
        return -1

def _roundQuat(rot):
    return map(lambda x: round(x, FLOAT_PRECISION), [rot.x, rot.y, rot.z, rot.w])

def _roundPos(pos):
    return map(lambda x: round(x, FLOAT_PRECISION), [pos.x, pos.y, pos.z])

def exportSkin(out, mesh, jointNames, influencesPerVertex):
    print("exporting skins for mesh: " + mesh.name())
    skins = filter(lambda skin: mesh in skin.getOutputGeometry(), ls(type='skinCluster'))
    print out.keys()
    if len(skins) > 0:
        print("mesh has " + str(len(skins)) + " skins")
        skin = skins[0]
        joints = skin.influenceObjects()
        for weights in skin.getWeights(mesh.vtx):
            numWeights = 0

            for i in range(0, len(weights)):
                if weights[i] > 0:
                    out["skinWeights"].append(weights[i])
                    out["skinIndices"].append(_indexOfJoint(joints[i].name(), jointNames))
                    numWeights += 1

            if numWeights > influencesPerVertex:
                raise Exception("More than " + str(influencesPerVertex) + " influences on a vertex in " + mesh.name() + ".")

            for i in range(0, influencesPerVertex - numWeights):
                out["skinWeights"].append(0)
                out["skinIndices"].append(0)
    else:
        print("mesh has no skins, appending 0")
        for i in range(0, len(mesh.getPoints()) * influencesPerVertex):
            out["skinWeights"].append(0)
            out["skinIndices"].append(0)

def exportKeyFrameAnimations(out):
    hierarchy = []
    i = -1
    frameRate = FramesPerSecond(currentUnit(query=True, time=True)).value()
    for joint in ls(type='joint'):
        hierarchy.append({
            "parent": i,
            "keyFrames": _getKeyframes(joint, frameRate)
        })
        i += 1

    out["animations"].append({
        "name": "skeletalAction.001",
        "length": (playbackOptions(maxTime=True, query=True) - playbackOptions(minTime=True, query=True)) / frameRate,
        "fps": 1,
        "hierarchy": hierarchy
    })

def _getKeyframes(joint, frameRate):
    firstFrame = playbackOptions(minTime=True, query=True)
    lastFrame = playbackOptions(maxTime=True, query=True)
    frames = sorted(list(set(keyframe(joint, query=True) + [firstFrame, lastFrame])))
    keys = []

    print("joint " + joint.name() + " has " + str(len(frames)) + " keyframes")
    for frame in frames:
        _goToFrame(frame)
        keys.append(_getCurrentKeyframe(joint, frame, frameRate))
    return keys

def _goToFrame(frame):
    currentTime(frame)

def _getCurrentKeyframe(joint, frame, frameRate):
    pos = joint.getTranslation()
    rot = joint.getRotation(quaternion=True) * joint.getOrientation()

    return {
        'time': (frame - playbackOptions(minTime=True, query=True)) / frameRate,
        'pos': _roundPos(pos),
        'rot': _roundQuat(rot),
        'scl': [1,1,1]
    }

class FramesPerSecond(object):
    MAYA_VALUES = {
        'game': 15,
        'film': 24,
        'pal': 25,
        'ntsc': 30,
        'show': 48,
        'palf': 50,
        'ntscf': 60
    }

    def __init__(self, fpsString):
        self.fpsString = fpsString

    def value(self):
        if self.fpsString in FramesPerSecond.MAYA_VALUES:
            return FramesPerSecond.MAYA_VALUES[self.fpsString]
        else:
            return int(filter(lambda c: c.isdigit(), self.fpsString))

exportMesh(out)
runtime.GoToBindPose()
exportBones(out, jointNames)
exportSkin(out, mesh, jointNames, 5)
exportKeyFrameAnimations(out)

print json.dumps(out)
