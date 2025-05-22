import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { COURSE } from "@/service/Instance/constants";

export const handlers = [
  http.get(COURSE, async ({ request, params, cookies }) => {
    return Response.success(
      {
        courses: [
          {
            secureId: faker.string.uuid(),
            id: faker.number.int({ min: 10, max: 10000 }),
            title: faker.lorem.words(3),
            description: faker.lorem.words(30),
            level: faker.lorem.words(1),
            type: faker.lorem.words(1),
            status: faker.lorem.words(1),
          },
          {
            secureId: faker.string.uuid(),
            id: faker.number.int({ min: 10, max: 10000 }),
            title: faker.lorem.words(3),
            description: faker.lorem.words(30),
            level: faker.lorem.words(1),
            type: faker.lorem.words(1),
            status: faker.lorem.words(1),
          },
          {
            secureId: faker.string.uuid(),
            id: faker.number.int({ min: 10, max: 10000 }),
            title: faker.lorem.words(3),
            description: faker.lorem.words(30),
            level: faker.lorem.words(1),
            type: faker.lorem.words(1),
            status: faker.lorem.words(1),
          },
        ],
      },
      {
        page: 1,
        limit: 10,
        totalRows: 1,
      }
    );
  }),
  http.get(`${COURSE}/:id`, async ({ request, params, cookies }) => {
    return Response.success({
      course: {
        title: "Introduction to 3D Modelling",
        description:
          "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
        videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
        level: "intermediate",
        type: "online",
        content:
          '{"time":1747830158223,"blocks":[{"id":"1QOhnzcTYM","type":"paragraph","data":{"text":"123123123"}},{"id":"mVYkvcMVBA","type":"list","data":{"style":"unordered","meta":{},"items":[{"content":"Unordered List","meta":{},"items":[]}]}},{"id":"3whSxwZPTz","type":"list","data":{"style":"ordered","meta":{"counterType":"numeric"},"items":[{"content":"Ordered List","meta":{},"items":[]}]}},{"id":"RDkrebq7yD","type":"list","data":{"style":"checklist","meta":{},"items":[{"content":"Checked","meta":{"checked":false},"items":[]}]}},{"id":"EWOA4uCJtF","type":"code","data":{"code":"const onSubmit = handleSubmit(async (values) => {\\n    const data = {\\n      ...values,\\n      contentCovered: contentCovered.value,\\n    };\\n\\n    console.log({ data });\\n  });"}},{"id":"S_LiwaCFjR","type":"raw","data":{"html":"<template>\\n  <div :class=\\"props.className\\">\\n    <label :for=\\"props.name\\">{{ name }}</label>\\n    <Textarea\\n      :id=\\"props.name\\"\\n      v-model=\\"value\\"\\n      required=\\"true\\"\\n      autofocus\\n      :rows=\\"props.rows\\"\\n      :placeholder=\\"props.placeholder\\"\\n      :disabled=\\"props.disabled\\"\\n    />\\n    <small v-if=\\"meta.touched && !meta.valid\\" class=\\"text-red-500\\">{{\\n      errorMessage\\n    }}</small>\\n  </div>\\n</template>\\n"}},{"id":"Na_T23eG4_","type":"quote","data":{"text":"Quotes Quotes Quotes","caption":"This is the Caption","alignment":"left"}}],"version":"2.31.0-rc.7"}',
        contentCovered: [
          {
            id: 1,
            level: 1,
            title: "Introduction to 3D Modelling",
            sub_contents: [
              {
                number: "01",
                title: "Understanding Digi-Doubles",
                description:
                  "Learn what Digi-Doubles are and their significance in modern VFX.",
                is_open: false,
                courses: [
                  {
                    title: "Understanding Digi-Doubles",
                    description:
                      "Learn what Digi-Doubles are and their significance in modern VFX.",
                    is_checked: true,
                  },
                  {
                    title: "Getting Started with Midjourney",
                    description:
                      "Learn what Digi-Doubles are and their significance in modern VFX.",
                    is_checked: false,
                  },
                ],
              },
              {
                number: "02",
                title: "Getting Started with Midjourney",
                description:
                  "A brief introduction to using Midjourney for creating stunning visuals.",
                is_open: false,
                courses: [
                  {
                    title: "Understanding Digi-Doubles",
                    description:
                      "Learn what Digi-Doubles are and their significance in modern VFX.",
                    is_checked: true,
                  },
                ],
              },
            ],
          },
          {
            id: 1,
            secureId: faker.string.uuid(),
            image: "https://picsum.photos/160/90",
            title: "Course 2",
            description: "Description 2",
            date: ["01/01/2024", "01/02/2024"],
            level: 2,
            linked_course: "url/link/to/course/1",
          },
          {
            id: 0,
            secureId: faker.string.uuid(),
            image: "https://picsum.photos/160/90",
            title: "Course 1",
            description: "Description 1",
            date: ["01/01/2024", "01/02/2024"],
            level: 3,
            linked_course: "url/link/to/course/0",
          },
        ],
      },
    });
  }),
];
