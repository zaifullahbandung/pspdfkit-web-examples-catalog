import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  return PSPDFKit.load({
    ...defaultConfiguration,
    annotationTooltipCallback: duplicateAnnotationTooltipCallback
  }).then(instance => {
    return instance;
  });
}

function duplicateAnnotationTooltipCallback(annotation) {
  // This is the tooltip item that will be used.
  const duplicateItem = {
    type: "custom",
    title: "Duplicate",
    id: "tooltip-duplicate-annotation",
    className: "TooltipItem-Duplication",
    onPress: () => {
      // For the new annotation, we will copy the current one but
      // translate the annotation for 50px so that our users see the
      // duplicated annotation.
      const newBoundingBox = annotation.boundingBox
        .set("top", annotation.boundingBox.top + 50)
        .set("left", annotation.boundingBox.left + 50);
      // To make duplication work, we also need to remove the ID
      // of the annotation.
      let duplicatedAnnotation = annotation
        .set("id", null)
        .set("boundingBox", newBoundingBox);

      // When it's an InkAnnotation, we not only need to move the bounding box
      // but also change the coordinates of the line. Since an ink annotation
      // could contain of multiple segments, we need go change each segment.
      // You can read more about the structure of InkAnnotations here:
      // https://pspdfkit.com/api/web/PSPDFKit.Annotations.InkAnnotation.html
      if (duplicatedAnnotation instanceof PSPDFKit.Annotations.InkAnnotation) {
        duplicatedAnnotation = duplicatedAnnotation.set(
          "lines",
          duplicatedAnnotation.lines.map(lines => {
            return lines.map(line =>
              line.set("x", line.x + 50).set("y", line.y + 50)
            );
          })
        );
      }
      // In the end, we just use `createAnnotation` on our
      // PSPDFKit instance.
      instance.createAnnotation(duplicatedAnnotation);
    }
  };
  return [duplicateItem];
}
