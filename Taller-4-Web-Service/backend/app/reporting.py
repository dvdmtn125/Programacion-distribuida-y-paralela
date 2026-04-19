from xml.etree.ElementTree import Element, SubElement, tostring


def build_enrollment_report_xml(total: int, distribution: list[dict[str, float | int | str]]) -> str:
    # Generates the XML report requested in the assignment.
    root = Element("reporte_inscripciones")

    total_node = SubElement(root, "total_estudiantes_inscritos")
    total_node.text = str(total)

    courses_node = SubElement(root, "cursos")
    for item in distribution:
        course_node = SubElement(courses_node, "curso")
        course_node.set("nombre", str(item["curso"]))

        enrolled_node = SubElement(course_node, "inscritos")
        enrolled_node.text = str(item["inscritos"])

        percent_node = SubElement(course_node, "porcentaje_estudiantes")
        percent_node.text = f'{item["porcentaje"]}%'

    return tostring(root, encoding="unicode")
