import { http } from "msw";
import { Response } from "../response";
import { faker } from "@faker-js/faker";
import { COURSE } from "@/service/Instance/constants";

export const handlers = [
  http.get(COURSE, async ({ request, params, cookies }) => {
    return Response.success(
      [
        {
          id: 1,
          title: "Introduction to 3D Modelling Level 1",
          description:
            "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
          imageUrl: "",
          videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
          level: "intermediate",
          type: "online",
          content:
            '{\n    "time": 1747830158223,\n    "blocks": [\n      {\n        "id": "1QOhnzcTYM",\n        "type": "paragraph",\n        "data": {\n          "text": "Course Overview"\n        }\n      },\n      {\n        "id": "mVYkvcMVBA",\n        "type": "list",\n        "data": {\n          "style": "unordered",\n          "items": [\n            "Introduction to 3D Modeling Concepts",\n            "Basic Geometry and Mesh Construction",\n            "Texturing and Materials",\n            "Lighting and Rendering"\n          ]\n        }\n      },\n      {\n        "id": "3whSxwZPTz",\n        "type": "list",\n        "data": {\n          "style": "ordered",\n          "items": [\n            "Week 1: Fundamentals",\n            "Week 2: Advanced Techniques",\n            "Week 3: Project Work",\n            "Week 4: Final Project"\n          ]\n        }\n      }\n    ],\n    "version": "2.31.0-rc.7"\n  }',
          startDate: "2024-03-20T00:00:00.000Z",
          endDate: "2024-06-20T00:00:00.000Z",
          createdAt: "2025-05-25T12:45:07.176Z",
          updatedAt: "2025-05-25T12:45:07.176Z",
        },
        {
          id: 3,
          title: "Introduction to 3D Modelling Level 3",
          description:
            "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
          imageUrl: "",
          videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
          level: "intermediate",
          type: "online",
          content:
            '{\n    "time": 1747830158223,\n    "blocks": [\n      {\n        "id": "1QOhnzcTYM",\n        "type": "paragraph",\n        "data": {\n          "text": "Course Overview"\n        }\n      },\n      {\n        "id": "mVYkvcMVBA",\n        "type": "list",\n        "data": {\n          "style": "unordered",\n          "items": [\n            "Introduction to 3D Modeling Concepts",\n            "Basic Geometry and Mesh Construction",\n            "Texturing and Materials",\n            "Lighting and Rendering"\n          ]\n        }\n      },\n      {\n        "id": "3whSxwZPTz",\n        "type": "list",\n        "data": {\n          "style": "ordered",\n          "items": [\n            "Week 1: Fundamentals",\n            "Week 2: Advanced Techniques",\n            "Week 3: Project Work",\n            "Week 4: Final Project"\n          ]\n        }\n      }\n    ],\n    "version": "2.31.0-rc.7"\n  }',
          startDate: "2024-03-20T00:00:00.000Z",
          endDate: "2024-06-20T00:00:00.000Z",
          createdAt: "2025-05-25T12:45:09.583Z",
          updatedAt: "2025-05-25T12:45:09.583Z",
        },
        {
          id: 2,
          title: "Introduction to 3D Modelling Level 2",
          description:
            "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
          imageUrl: "",
          videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
          level: "intermediate",
          type: "online",
          content:
            '{\n    "time": 1747830158223,\n    "blocks": [\n      {\n        "id": "1QOhnzcTYM",\n        "type": "paragraph",\n        "data": {\n          "text": "Course Overview"\n        }\n      },\n      {\n        "id": "mVYkvcMVBA",\n        "type": "list",\n        "data": {\n          "style": "unordered",\n          "items": [\n            "Introduction to 3D Modeling Concepts",\n            "Basic Geometry and Mesh Construction",\n            "Texturing and Materials",\n            "Lighting and Rendering"\n          ]\n        }\n      },\n      {\n        "id": "3whSxwZPTz",\n        "type": "list",\n        "data": {\n          "style": "ordered",\n          "items": [\n            "Week 1: Fundamentals",\n            "Week 2: Advanced Techniques",\n            "Week 3: Project Work",\n            "Week 4: Final Project"\n          ]\n        }\n      }\n    ],\n    "version": "2.31.0-rc.7"\n  }',
          startDate: "2024-03-20T00:00:00.000Z",
          endDate: "2024-06-20T00:00:00.000Z",
          createdAt: "2025-05-25T12:45:09.119Z",
          updatedAt: "2025-05-25T12:45:09.119Z",
        },
        {
          id: 26,
          title: "UPDATE GAES",
          description: "Testing Create Course",
          imageUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
          videoUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
          level: "intermediate",
          type: "online",
          content:
            '{"time":1748162561085,"blocks":[{"id":"fFv57Qyk02","type":"paragraph","data":{"text":"123123213"}},{"id":"i5Jz5lsXdC","type":"header","data":{"text":"123123123","level":2}}],"version":"2.31.0-rc.7"}',
          startDate: "2025-01-01T00:00:00.000Z",
          endDate: "2025-01-02T00:00:00.000Z",
          createdAt: "2025-05-25T18:43:39.684Z",
          updatedAt: "2025-05-25T11:44:38.596Z",
        },
      ],
      {
        page: 1,
        limit: 10,
        totalRows: 1,
      }
    );
  }),
  http.get(`${COURSE}/:id`, async ({ request, params, cookies }) => {
    return Response.success([
      {
        id: 26,
        title: "UPDATE GAES",
        description: "Testing Create Course",
        imageUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
        videoUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
        level: "intermediate",
        type: "online",
        content:
          '{"time":1748162561085,"blocks":[{"id":"fFv57Qyk02","type":"paragraph","data":{"text":"123123213"}},{"id":"i5Jz5lsXdC","type":"header","data":{"text":"123123123","level":2}}],"version":"2.31.0-rc.7"}',
        startDate: "2025-01-01T00:00:00.000Z",
        endDate: "2025-01-02T00:00:00.000Z",
        createdAt: "2025-05-25T18:43:39.684Z",
        updatedAt: "2025-05-25T11:44:38.596Z",
        contentCovered: [
          {
            id: 76,
            parentCourseId: 26,
            courseId: 26,
            level: 1,
            type: "PARENT",
            courses: {
              id: 26,
              title: "UPDATE GAES",
              description: "Testing Create Course",
              imageUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
              videoUrl: "https://www.youtube.com/watch?v=9zmTFEqkO1g&t=870s",
              level: "intermediate",
              type: "online",
              content:
                '{"time":1748162561085,"blocks":[{"id":"fFv57Qyk02","type":"paragraph","data":{"text":"123123213"}},{"id":"i5Jz5lsXdC","type":"header","data":{"text":"123123123","level":2}}],"version":"2.31.0-rc.7"}',
              startDate: "2025-01-01T00:00:00.000Z",
              endDate: "2025-01-02T00:00:00.000Z",
              createdAt: "2025-05-25T18:43:39.684Z",
              updatedAt: "2025-05-25T11:44:38.596Z",
            },
            subContents: [
              {
                id: 37,
                contentCoveredId: 76,
                title: "Sub Content Title UPDATE",
                number: "01",
                description: "Sub Content Description",
                subCourses: [
                  {
                    id: 94,
                    subContentId: 37,
                    title: "Sub-Course UPDATE",
                    description: "Sub-Course Description",
                  },
                  {
                    id: 95,
                    subContentId: 37,
                    title: "Sub-Course UPDATE 2",
                    description: "Sub-Course 2 UPDATE Description\n",
                  },
                ],
              },
              {
                id: 38,
                contentCoveredId: 76,
                title: "Sub Content Title 2 xxxx",
                number: "02",
                description: "Sub Content Description 2 xxxx",
                subCourses: [
                  {
                    id: 96,
                    subContentId: 38,
                    title: "Sub-Course ",
                    description: "Sub-Course Description xxxx",
                  },
                  {
                    id: 97,
                    subContentId: 38,
                    title: "Sub-Course 2",
                    description: "Sub-Course Description xxxx",
                  },
                ],
              },
            ],
          },
          {
            id: 77,
            parentCourseId: 26,
            courseId: 2,
            level: 2,
            type: "CHILDREN",
            courses: {
              id: 2,
              title: "Introduction to 3D Modelling Level 2",
              description:
                "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
              imageUrl: "",
              videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
              level: "intermediate",
              type: "online",
              content:
                '{\n    "time": 1747830158223,\n    "blocks": [\n      {\n        "id": "1QOhnzcTYM",\n        "type": "paragraph",\n        "data": {\n          "text": "Course Overview"\n        }\n      },\n      {\n        "id": "mVYkvcMVBA",\n        "type": "list",\n        "data": {\n          "style": "unordered",\n          "items": [\n            "Introduction to 3D Modeling Concepts",\n            "Basic Geometry and Mesh Construction",\n            "Texturing and Materials",\n            "Lighting and Rendering"\n          ]\n        }\n      },\n      {\n        "id": "3whSxwZPTz",\n        "type": "list",\n        "data": {\n          "style": "ordered",\n          "items": [\n            "Week 1: Fundamentals",\n            "Week 2: Advanced Techniques",\n            "Week 3: Project Work",\n            "Week 4: Final Project"\n          ]\n        }\n      }\n    ],\n    "version": "2.31.0-rc.7"\n  }',
              startDate: "2024-03-20T00:00:00.000Z",
              endDate: "2024-06-20T00:00:00.000Z",
              createdAt: "2025-05-25T12:45:09.119Z",
              updatedAt: "2025-05-25T12:45:09.119Z",
            },
          },
          {
            id: 78,
            parentCourseId: 26,
            courseId: 3,
            level: 3,
            type: "CHILDREN",
            courses: {
              id: 3,
              title: "Introduction to 3D Modelling Level 3",
              description:
                "This course provides a foundational understanding of 3D modelling, covering essential concepts, tools, and techniques used to create three-dimensional digital objects. Students will learn about basic geometry, mesh construction, modeling workflows, and software applications commonly used in the industry, such as Blender, Maya, or 3ds Max. Through hands-on projects, learners will explore object creation, modification, texturing, and rendering, gaining the skills needed to bring their ideas to life in a digital 3D environment. This course is ideal for beginners interested in animation, game design, visual effects, or product visualization.",
              imageUrl: "",
              videoUrl: "https://www.youtube.com/watch?v=Tc_JWD9NhKY",
              level: "intermediate",
              type: "online",
              content:
                '{\n    "time": 1747830158223,\n    "blocks": [\n      {\n        "id": "1QOhnzcTYM",\n        "type": "paragraph",\n        "data": {\n          "text": "Course Overview"\n        }\n      },\n      {\n        "id": "mVYkvcMVBA",\n        "type": "list",\n        "data": {\n          "style": "unordered",\n          "items": [\n            "Introduction to 3D Modeling Concepts",\n            "Basic Geometry and Mesh Construction",\n            "Texturing and Materials",\n            "Lighting and Rendering"\n          ]\n        }\n      },\n      {\n        "id": "3whSxwZPTz",\n        "type": "list",\n        "data": {\n          "style": "ordered",\n          "items": [\n            "Week 1: Fundamentals",\n            "Week 2: Advanced Techniques",\n            "Week 3: Project Work",\n            "Week 4: Final Project"\n          ]\n        }\n      }\n    ],\n    "version": "2.31.0-rc.7"\n  }',
              startDate: "2024-03-20T00:00:00.000Z",
              endDate: "2024-06-20T00:00:00.000Z",
              createdAt: "2025-05-25T12:45:09.583Z",
              updatedAt: "2025-05-25T12:45:09.583Z",
            },
          },
        ],
      },
    ]);
  }),
];
