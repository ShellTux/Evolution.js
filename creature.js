class Creature {
  constructor(type = 'frogger', brain) {
    this.type = type;
    this.joints = [];
    this.bones = [];
    this.muscles = [];
    this.startPoint = {
      x: 370,
      y: 610
    };
    this.distH = 0;
    this.distV = 0;
    this.avgSpeed = 0;
    this.setBody(type, brain);
  }

  show() {
    ctx.fillStyle = rgb(200, 10, 10);
    for (let joint of this.joints) ctx.ellipse(joint.position.x, joint.position.y, joint.circleRadius * 2, joint.circleRadius * 2);

    ctx.fillStyle = rgb(10);
    for (let bone of this.bones) {
      ctx.beginPath();
      ctx.moveTo(bone.vertices[0].x, bone.vertices[0].y);
      for (let i = 1; i < bone.vertices.length; i++) ctx.lineTo(bone.vertices[i].x, bone.vertices[i].y);
      ctx.fill();
      ctx.closePath();
    }

    ctx.lineWidth = 2;
    for (let i = 0; i < this.muscles.length; i++) {
      let muscle = this.muscles[i];
      ctx.strokeStyle = muscle.length < this.musclesLengths[i] ? rgb(200, 10, 10) : rgb(10, 10, 200);
      ctx.line(muscle.bodyA.position.x, muscle.bodyA.position.y, muscle.bodyB.position.x, muscle.bodyB.position.y);
    }
  }

  think() {
    // let x = this.joints.reduce((acc, j) => acc + j.position.x, 0) / this.joints.length;
    let y = this.joints.reduce((acc, j) => acc + j.position.y, 0) / this.joints.length;
    let inputs = [y / cv.height];
    this.muscles.forEach(muscle => inputs.push(muscle.length));
    let outputs = this.brain.predict(inputs);
    outputs = outputs.map(value => map(value, 0.5, 1, 1, 2));
    this.muscles.forEach((muscle, i) => muscle.length = this.musclesLengths[i] * outputs[i]);
  }

  addJoint(x, y, r) {
    let options = {
      friction: 0.6,
      frictionStatic: 0.3
    }
    let joint = Matter.Bodies.circle(x, y, r, options);
    joint.collisionFilter.group = -1;
    this.joints.push(joint);
    Matter.World.add(world, joint);
  }

  addBone(jointA, jointB) {
    let boneOpt = {
      x: (jointA.position.x + jointB.position.x) / 2,
      y: (jointA.position.y + jointB.position.y) / 2,
      length: Math.dist(jointA.position.x, jointA.position.y, jointB.position.x, jointB.position.y),
      angle: Math.atan2(jointB.position.y - jointA.position.y, jointB.position.x - jointA.position.x),
      mass: 1,
      friction: 0.6
    };
    let bone = Matter.Bodies.rectangle(boneOpt.x, boneOpt.y, boneOpt.length, 5, boneOpt);
    bone.collisionFilter.group = -1;
    this.bones.push(bone);
    Matter.World.add(world, bone);
    let options1 = {
      bodyA: bone,
      bodyB: jointA,
      pointA: {
        x: jointA.position.x - bone.position.x,
        y: jointA.position.y - bone.position.y
      },
      length: 0.5,
      stiffness: 1
    };

    let options2 = {
      bodyA: bone,
      bodyB: jointB,
      pointA: {
        x: jointB.position.x - bone.position.x,
        y: jointB.position.y - bone.position.y
      },
      length: 0.5,
      stiffness: 1
    };
    let tension1 = Matter.Constraint.create(options1);
    let tension2 = Matter.Constraint.create(options2);

    Matter.World.add(world, tension1);
    Matter.World.add(world, tension2);
  }

  addMuscle(boneA, boneB) {
    let options = {
      bodyA: boneA,
      bodyB: boneB,
      length: Math.dist(boneA.position.x, boneA.position.y, boneB.position.x, boneB.position.y),
      stiffness: 0.25
    }
    let muscle = Matter.Constraint.create(options);
    this.muscles.push(muscle);
    Matter.World.add(world, muscle);
  }

  setBody(specie, brain) {
    switch (specie) {
      case 'frogger':
        this.addJoint(this.startPoint.x - 70, this.startPoint.y + 90, 10); //Joint 1
        this.addJoint(this.startPoint.x - 190, this.startPoint.y + 50, 10); //Joint 2
        this.addJoint(this.startPoint.x, this.startPoint.y, 15); //Joint 3
        this.addJoint(this.startPoint.x - 100, this.startPoint.y - 30, 10); //Joint 4
        this.addJoint(this.startPoint.x + 90, this.startPoint.y - 90, 10); //Joint 5
        this.addJoint(this.startPoint.x + 80, this.startPoint.y - 20, 10); //Joint 6
        this.addJoint(this.startPoint.x + 180, this.startPoint.y + 30, 10); //Joint 7

        this.addBone(this.joints[0], this.joints[1]); //Bone between joint 1 and joint 2
        this.addBone(this.joints[1], this.joints[2]); //Bone between joint 2 and joint 3
        this.addBone(this.joints[2], this.joints[3]); //Bone between joint 3 and joint 4
        this.addBone(this.joints[3], this.joints[4]); //Bone between joint 4 and joint 5
        this.addBone(this.joints[4], this.joints[5]); //Bone between joint 5 and joint 6
        this.addBone(this.joints[5], this.joints[6]); //Bone between joint 6 and joint7

        this.addMuscle(this.bones[0], this.bones[1]); //Muscle between bone 1 and bone 2
        this.addMuscle(this.bones[1], this.bones[2]); //Muscle between bone 2 and bone 3
        this.addMuscle(this.bones[2], this.bones[3]); //Muscle between bone 3 and bone 4
        this.addMuscle(this.bones[3], this.bones[4]); //Muscle between bone 4 and bone 5
        this.addMuscle(this.bones[4], this.bones[5]); //Muscle between bone 5 and bone 6
        break;
      default:
    }
    if (brain) this.brain = brain.copy();
    else this.brain = new NeuralNetwork(this.muscles.length + 1, 10, this.muscles.length);
    this.musclesLengths = this.muscles.map(muscle => muscle.length);
  }

  mutate() {
    let mutation = function(val) {
      let rate = 0.1;
      if (Math.random() < rate) return val + random(-0.1, 0.1);
      else return val;
    }
    this.brain.mutate(mutation);
  }
}