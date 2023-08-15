import { Component } from "@angular/core";
import { registerElement } from "@nativescript/angular";
import { Canvas, WebGLRenderingContext } from "@nativescript/canvas";
import * as THREE from "three";
import { Noise } from "noisejs";

var noise = new Noise(Math.random());

registerElement("Canvas", () => Canvas);

@Component({
  selector: "ns-blob",
  template: `
    <ActionBar title="My Profile" class="bg-fleece text-zinc-800" flat="true">
      <ActionItem
        ios.systemIcon="20"
        ios.position="right"
        android.systemIcon="ic_menu"
        android.position="actionBar"
      ></ActionItem>
    </ActionBar>

    <GridLayout class="container bg-fleece">
      <Canvas (ready)="onCanvasReady($event)" rowSpan="3"></Canvas>

      <Label
        text="LABEL1"
        class="text-8xl text-center font-thin text-zinc-800"
        row="1"
        verticalAlignment="center"
        textWrap="true"
      ></Label>

      <Image
        row="2"
        width="100"
        horizontalAlignment="left"
        class="ml-16"
        src="https://uxwing.com/wp-content/themes/uxwing/download/arrow-direction/thin-long-arrow-right-icon.png"
      ></Image>
      <Label
        text="7  -  8"
        class="text-2xl rotate-90 font-light ml-20 text-zinc-800"
        row="2"
      ></Label>

      <StackLayout orientation="horizontal" class="ml-14">
        <StackLayout
          class="w-6 bg-zinc-800"
          height="2"
          verticalAlignment="center"
        ></StackLayout>
        <Label
          text="Illustration"
          class="text-base text-center font-light ml-1 text-zinc-800"
          verticalAlignment="center"
          row="1"
        ></Label>
      </StackLayout>
    </GridLayout>
  `,
  styles: [
    `
      .container {
        rows: 20*, 50*, 30*;
      }
    `,
  ],
})
export class BlobComponent {
  canvas: Canvas;
  ctx: WebGLRenderingContext;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  size: number;
  width: number;
  height: number;
  sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshNormalMaterial>;
  noise: Noise;
  vertexCount = 64;
  timeAg = 0.0005;

  onWindowResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
  }

  onCanvasReady(args) {
    this.canvas = args?.object as Canvas;
    this.ctx = this.canvas?.getContext("webgl2") as WebGLRenderingContext;

    this.width = this.ctx.drawingBufferWidth;
    this.height = this.ctx.drawingBufferHeight;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      context: this.ctx as any,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    const sphere_geometry = new THREE.SphereGeometry(
      1,
      this.vertexCount,
      this.vertexCount
    );
    const material = new THREE.MeshNormalMaterial();

    this.sphere = new THREE.Mesh(sphere_geometry, material);
    this.scene.add(this.sphere);

    requestAnimationFrame(this.renderAnimation);

    window.addEventListener("resize", this.onWindowResize);
  }

  renderAnimation = () => {
    // this.sphere.rotation.x += 0.01;
    this.sphere.rotation.y += 0.01;

    const time = global.isAndroid
      ? Number(__time()) * this.timeAg
      : performance.now() * this.timeAg;

    // change 'k' value for more spikes
    let k = 1.33;

    const positionAttribute: any = this.sphere.geometry.getAttribute("position");
    const vertex = new THREE.Vector3();

    if (positionAttribute) {
      for (let i = 0; i < positionAttribute?.count; i++) {
        let p = vertex.fromBufferAttribute( positionAttribute as any, i );
        p.normalize().multiplyScalar(
          0.6 + 0.3 * noise.perlin3(p.x * k + time, p.y * k, p.z * k)
        );

        positionAttribute.setXYZ( i, p.x, p.y, p.z );
      }
      positionAttribute.needsUpdate = true;
    }

    this.sphere.geometry.computeVertexNormals();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.renderAnimation);
  };
}
